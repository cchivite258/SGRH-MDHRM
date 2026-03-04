import axios from "@/app/http/axios";

export default class HttpService {
  async get<T>(path: string): Promise<T> {
    try {
      const response = await axios.get<T>(path);
      return response.data;
    } catch (error: any) {
      console.error("Erro no GET:", error);
      throw error;
    }
  }

  async post<T>(path: string, payload: Record<string, any>): Promise<T> {
    try {
      const response = await axios.post<T>(path, payload);
      return response.data;
    } catch (error: any) {
      console.error("Erro no POST:", error);
      throw error;
    }
  }

  async delete<T = void>(path: string): Promise<T> {
    try {
      const response = await axios.delete<T>(path);
      return response.data;
    } catch (error: any) {
      console.error("Erro no DELETE:", error);
      throw error;
    }
  }

  async put<T>(path: string, payload: Record<string, any> = {}): Promise<T> {
    try {
      const response = await axios.put<T>(path, payload);
      return response.data;
    } catch (error: any) {
      console.error("Erro no PUT:", error);
      throw error;
    }
  }

  async putFile<T>(path: string, formData: FormData): Promise<T> {
    try {
      const response = await axios.put<T>(path, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: any) {
      console.error("Erro no PUT de ficheiro:", error);
      throw error;
    }
  }

  /**
   * Download binário (PDF, imagem, ZIP, etc)
   */
  async downloadFile(path: string): Promise<Blob> {
    const response = await axios.get(path, {
      responseType: "blob", // ← ESSENCIAL
    });
    return response.data; // ← retorna Blob
  }
 

}
