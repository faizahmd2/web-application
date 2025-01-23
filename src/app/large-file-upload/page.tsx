'use client'

import { useRef, useState } from "react";
import { File, Upload as UploadIcon, X } from "lucide-react";
import useExitPrompt from "../hooks/useExitPrompt";

const apiBaseUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL;
let controller = new AbortController();
const UPLOAD_CHUNK_SIZE_PER_REQUEST = 5 * 1000; // In KB

interface FileInfo {
  file: File | null;
  fileName: string;
  fileSize: number;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function Upload() {
  const [upload, setUpload] = useState<boolean>(false);
  const [fileInfo, setFileInfo] = useState<FileInfo>({
    file: null,
    fileName: "",
    fileSize: 0,
  });

  const inputRef = useRef<HTMLInputElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const percentageRef = useRef<HTMLDivElement | null>(null);

  async function uploadLargeFile() {
    if (fileInfo.file) {
      setUpload(true);
      const { file, fileName, fileSize } = fileInfo;
      const CHUNK_SIZE = 1024;
      const SIZE_IN_KILOBYTE = fileSize / CHUNK_SIZE;
      const chunkCount = Math.ceil(SIZE_IN_KILOBYTE / UPLOAD_CHUNK_SIZE_PER_REQUEST);
      const chunkSize = UPLOAD_CHUNK_SIZE_PER_REQUEST * CHUNK_SIZE;

      updateProgress("0"); // Initialize progress at 0%
 
      const event = await handleUploadEvent(fileName, "start", fileSize, chunkCount);
      if (!event) {
        alert("Something bad happened, Please try again!");
        setUpload(false);
        return;
      }

      let isFailed = false;
      let alertMessage = "";
      let successCount = 0;
      let totalBytesUploaded = 0;

      for (let i = 0; i < chunkCount; i++) {
        if (controller.signal.aborted) break;

        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, fileSize);
        const currentChunkSize = end - start;
        
        // Calculate actual progress based on bytes uploaded
        totalBytesUploaded += currentChunkSize;
        const actualProgress = Math.min((totalBytesUploaded / fileSize) * 100, 100);
        updateProgress(actualProgress.toFixed(1));

        const chunk = file.slice(start, end);
        const formData = new FormData();
        formData.append("file", chunk);

        const options: RequestInit = {
          method: "POST",
          body: formData,
          signal: controller.signal,
        };

        let currentPart = i + 1;
        try {
          const response = await fetch(`${apiBaseUrl}/upload?fileName=${fileName}&currentPart=${currentPart}`, options);
          if (!response.ok) {
            isFailed = true;
            alertMessage = "Something Went Wrong!";
            break;
          }
          const responseData = await response.json();

          alertMessage = responseData.message;
          if (responseData.status === 1) {
            successCount++;
          } else {
            isFailed = true;
            break;
          }
        } catch (error) {
          console.error(error);
          isFailed = true;
          break;
        }
      }

      // Ensure 100% progress on successful completion
      if (successCount === chunkCount) {
        updateProgress("100");
      }

      if (successCount === chunkCount || isFailed) {
        alert(alertMessage);
        await handleUploadEvent(fileName, isFailed ? "drop" : "end");
        if (!isFailed && inputRef.current) {
          inputRef.current.value = "";
          setFileInfo({ file: null, fileName: "", fileSize: 0 });
        }
      }
      setUpload(false);
    } else {
      alert("Please Select File");
    }
  }

  async function handleUploadEvent(
    fileName: string,
    type: string,
    fileSize?: number,
    totalParts?: number
  ): Promise<boolean | string> {
    try {
      const response = await fetch(
        `${apiBaseUrl}/upload-event/${type}?fileName=${fileName}&fileSize=${fileSize || 0}&totalParts=${totalParts}`
      );
      if (!response.ok) {
        return false;
      }

      const responseData = await response.json();
      return responseData.status === 0 ? false : responseData.message || true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  const handleReloadDuringUpload = () => {
    if (upload && fileInfo.fileName) {
      controller.abort();
      const img = new Image();
      img.src = `${apiBaseUrl}/upload-event/drop?fileName=${fileInfo.fileName}`;
    }
  };

  useExitPrompt(upload, handleReloadDuringUpload);

  function updateProgress(percent: string) {
    const percentage = Math.min(parseFloat(percent), 100);
    if (progressRef.current) {
      progressRef.current.style.width = `${percentage}%`;
    }
    if (percentageRef.current) {
      percentageRef.current.textContent = `${percentage}%`;
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const fileName = `${Date.now()}_${file.name}`;
      const fileSize = file.size;
      setFileInfo({ file, fileName, fileSize });
    }
  };

  const clearFile = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    setFileInfo({ file: null, fileName: "", fileSize: 0 });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Upload Files</h1>
        <p className="text-gray-600">Drag and drop files or browse to upload</p>
      </div>

      <div className="w-full max-w-3xl bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <label
          htmlFor="file-upload"
          className={`${
            upload ? "opacity-50 pointer-events-none" : ""
          } relative w-full h-52 border-2 border-dashed border-gray-300 rounded-lg flex flex-col justify-center items-center cursor-pointer hover:border-blue-500 transition-colors group`}
        >
          <div className="flex flex-col items-center">
            <UploadIcon className="h-12 w-12 text-gray-400 mb-3 group-hover:text-blue-500" />
            <span className="text-gray-600 font-medium mb-1">Drag & Drop your files here</span>
            <span className="text-gray-400 text-sm mb-2">or</span>
            <span className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md shadow-sm hover:bg-blue-700 transition-colors">
              Browse Files
            </span>
          </div>
          <input
            onChange={handleChange}
            ref={inputRef}
            type="file"
            id="file-upload"
            accept="*"
            required
            className="hidden"
          />
        </label>

        {fileInfo.file && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <File className="h-6 w-6 text-gray-500" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">
                  {fileInfo.file.name}
                </span>
                <span className="text-xs text-gray-500">
                  {formatFileSize(fileInfo.fileSize)}
                </span>
              </div>
            </div>
            {!upload && (
              <button
                onClick={clearFile}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            )}
          </div>
        )}

        {upload && (
          <div className="mt-4">
            <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                ref={progressRef}
                className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-300"
                style={{ width: '0%' }}
              ></div>
            </div>
            <div
              ref={percentageRef}
              className="text-sm text-center text-gray-600 mt-2"
            >0%</div>
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <button
            disabled={upload || !fileInfo.file}
            className={`px-6 py-3 text-white rounded-md shadow-sm transition-colors ${
              upload || !fileInfo.file
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
            onClick={uploadLargeFile}
          >
            {upload ? "Uploading..." : "Upload File"}
          </button>
        </div>
      </div>
    </div>
  );
}