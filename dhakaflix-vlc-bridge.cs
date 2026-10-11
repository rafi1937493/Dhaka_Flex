using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Text;
using System.Web.Script.Serialization;

internal static class DhakaFlixVlcBridge
{
    private static readonly string LogPath = Path.Combine(Path.GetTempPath(), "dhakaflix-vlc-bridge.log");

    private static void Log(string message)
    {
        try { File.AppendAllText(LogPath, DateTime.Now.ToString("s") + " " + message + Environment.NewLine); }
        catch { }
    }

    private static byte[] ReadExactly(Stream input, int count)
    {
        byte[] buffer = new byte[count];
        int offset = 0;
        while (offset < count)
        {
            int read = input.Read(buffer, offset, count - offset);
            if (read <= 0) throw new EndOfStreamException("Native messaging input ended early.");
            offset += read;
        }
        return buffer;
    }

    private static void Respond(Stream output, object response)
    {
        byte[] body = new UTF8Encoding(false).GetBytes(new JavaScriptSerializer().Serialize(response));
        output.Write(BitConverter.GetBytes(body.Length), 0, 4);
        output.Write(body, 0, body.Length);
        output.Flush();
    }

    private static int Main(string[] args)
    {
        try
        {
            bool originPresent = false;
            if (args != null)
                foreach (string arg in args)
                    if (arg != null && arg.StartsWith("chrome-extension://", StringComparison.OrdinalIgnoreCase)) originPresent = true;
            // Chrome enforces the extension allowlist in the native-host manifest before launch.
            if (!originPresent) { Log("DENIED missing extension origin args=" + String.Join(" ", args ?? new string[0])); return 2; }

            Stream input = Console.OpenStandardInput();
            Stream output = Console.OpenStandardOutput();
            byte[] header = ReadExactly(input, 4);
            int length = BitConverter.ToInt32(header, 0);
            if (length < 2 || length > 1024 * 1024) throw new InvalidDataException("Invalid native message length.");
            string json = new UTF8Encoding(false).GetString(ReadExactly(input, length));
            Log("REQUEST " + json);

            var payload = new JavaScriptSerializer().Deserialize<Dictionary<string, object>>(json);
            object value;
            string rawUrl = payload != null && payload.TryGetValue("url", out value) ? value as string : null;
            Uri stream;
            if (String.IsNullOrWhiteSpace(rawUrl) || !Uri.TryCreate(rawUrl, UriKind.Absolute, out stream))
            {
                Respond(output, new { ok = false, error = "The movie address is missing or invalid." });
                return 0;
            }
            if (!String.Equals(stream.Scheme, "http", StringComparison.OrdinalIgnoreCase) || stream.Port != 80 || stream.UserInfo.Length != 0 || (stream.Host != "172.16.50.7" && stream.Host != "172.16.50.8" && stream.Host != "172.16.50.10" && stream.Host != "172.16.50.12" && stream.Host != "172.16.50.14"))
            {
                Respond(output, new { ok = false, error = "This address is not a supported DhakaFlix movie link." });
                return 0;
            }

            string[] vlcCandidates = {
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), "VideoLAN", "VLC", "vlc.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), "VideoLAN", "VLC", "vlc.exe")
            };
            string vlc = Array.Find(vlcCandidates, File.Exists);
            if (String.IsNullOrEmpty(vlc))
            {
                Respond(output, new { ok = false, error = "VLC was not found. Install VLC Media Player, then try again." });
                return 0;
            }
            var start = new ProcessStartInfo();
            start.FileName = vlc;
            start.Arguments = "\"" + stream.AbsoluteUri + "\"";
            start.UseShellExecute = false;
            Process process = Process.Start(start);
            Log("LAUNCHED pid=" + (process == null ? "null" : process.Id.ToString()));
            Respond(output, new { ok = true });
            return 0;
        }
        catch (Exception ex)
        {
            Log("ERROR " + ex.ToString());
            try { Respond(Console.OpenStandardOutput(), new { ok = false, error = "The VLC helper failed: " + ex.Message }); }
            catch { }
            return 1;
        }
    }
}


