import { get } from './api';

const API_ROOT =
  import.meta.env.VITE_API_ROOT ||
  'http://localhost:5208/api';

export interface ClientDocument {
  id: number;
  bookingNumber: string;
  fileName: string;
  documentType: string;
  createdAt: string;
}

export interface ClientDocumentList {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  data: ClientDocument[];
}

interface DocumentResponse {
  success: boolean;
  message: string;
  data: ClientDocumentList;
}

interface UploadDocumentResponse {
  message: string;

  document: {
    id: number;
    documentType: string;
    originalFileName: string;
    contentType: string;
    fileSize: number;
    createdAt: string;
  };
}

export function getDocuments(
  page = 1,
  pageSize = 10,
  bookingNumber = '',
  documentType = ''
) {
  const params =
    new URLSearchParams();

  params.set(
    'page',
    String(page)
  );

  params.set(
    'pageSize',
    String(pageSize)
  );

  if (bookingNumber.trim()) {
    params.set(
      'bookingNumber',
      bookingNumber.trim()
    );
  }

  if (documentType) {
    params.set(
      'documentType',
      documentType
    );
  }

  return get<DocumentResponse>(
    `/client/documents?${params.toString()}`
  );
}

export async function uploadDocument(
  bookingNumber: string,
  documentType: string,
  file: File
) {
  const token =
    localStorage.getItem('token');

  const formData =
    new FormData();

  formData.append(
    'File',
    file
  );

  formData.append(
    'DocumentType',
    documentType
  );

  const response =
    await fetch(
      `${API_ROOT}/BookingDocument/${encodeURIComponent(
        bookingNumber.trim()
      )}/upload`,
      {
        method: 'POST',

        headers: token
          ? {
              Authorization:
                `Bearer ${token}`
            }
          : undefined,

        body: formData
      }
    );

  const text =
    await response.text();

  let data: any = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
      text ||
      `Upload failed (${response.status})`
    );
  }

  return data as UploadDocumentResponse;
}

export async function downloadDocument(
  documentId: number,
  fileName: string,
  preview = false
) {
  const token =
    localStorage.getItem('token');

  const response =
    await fetch(
      `${API_ROOT}/BookingDocument/download/${documentId}`,
      {
        headers: token
          ? {
              Authorization:
                `Bearer ${token}`
            }
          : undefined
      }
    );

  if (!response.ok) {
    let message =
      `Download failed (${response.status})`;

    try {
      const data =
        await response.json();

      message =
        data.message ||
        message;
    } catch {
      // Ignore non JSON response.
    }

    throw new Error(message);
  }

  const blob =
    await response.blob();

  const url =
    URL.createObjectURL(blob);

  if (preview) {
    window.open(
      url,
      '_blank',
      'noopener,noreferrer'
    );

    setTimeout(
      () =>
        URL.revokeObjectURL(url),
      60000
    );

    return;
  }

  const anchor =
    document.createElement('a');

  anchor.href = url;
  anchor.download =
    fileName || 'document';

  document.body.appendChild(
    anchor
  );

  anchor.click();

  anchor.remove();

  URL.revokeObjectURL(url);
}
