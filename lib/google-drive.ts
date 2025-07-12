declare global {
  interface Window {
    gapi: any;
  }
}

export class GoogleDriveService {
  private static isInitialized = false;

  static async initialize(): Promise<void> {
    if (this.isInitialized) return;

    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://apis.google.com/js/api.js";
      script.onload = () => {
        window.gapi.load("client:auth2", () => {
          window.gapi.client
            .init({
              apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
              clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
              discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
              scope: "https://www.googleapis.com/auth/drive.file",
            })
            .then(() => {
              this.isInitialized = true;
              resolve();
            });
        });
      };
      document.head.appendChild(script);
    });
  }

  static async signIn(): Promise<boolean> {
    await this.initialize();
    const authInstance = window.gapi.auth2.getAuthInstance();

    if (!authInstance.isSignedIn.get()) {
      await authInstance.signIn();
    }

    return authInstance.isSignedIn.get();
  }

  static async uploadFile(fileData: Uint8Array, fileName: string): Promise<string> {
    const isSignedIn = await this.signIn();
    if (!isSignedIn) throw new Error("Not signed in to Google");

    const boundary = "-------314159265358979323846";
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    const metadata = {
      name: fileName,
      parents: [], // Root folder
    };

    const multipartRequestBody =
      delimiter +
      "Content-Type: application/json\r\n\r\n" +
      JSON.stringify(metadata) +
      delimiter +
      "Content-Type: application/pdf\r\n" +
      "Content-Transfer-Encoding: base64\r\n" +
      "\r\n" +
      btoa(Array.prototype.map.call(fileData, (ch: number) => String.fromCharCode(ch)).join("")) +
      close_delim;

    const request = window.gapi.client.request({
      path: "https://www.googleapis.com/upload/drive/v3/files",
      method: "POST",
      params: { uploadType: "multipart" },
      headers: {
        "Content-Type": 'multipart/related; boundary="' + boundary + '"',
      },
      body: multipartRequestBody,
    });

    const response = await request;
    return response.result.id;
  }
}
