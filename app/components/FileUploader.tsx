import React, { useState , useCallback} from 'react'
import {useDropzone} from 'react-dropzone'

interface FileUploaderProps {
    onFileSelect?: (file: File) => void;
}

function formatSize(bytes) {
    if (bytes === 0) return "0 Bytes";

    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const value = bytes / Math.pow(1024, i);

    return value.toFixed(2) + " " + sizes[i];
}

const FileUploader = ({onFileSelect} : FileUploaderProps) => {

    const onDrop = useCallback((acceptedFiles:File[]) => {
        // Do something with the files
        const file = acceptedFiles[0] || null;
        onFileSelect?.(file);

    }, [onFileSelect])

    const {getRootProps, getInputProps, isDragActive ,acceptedFiles} = useDropzone({
        onDrop,
        multiple: false,
        accept: {'application/pdf':['pdf']},
        maxSize: 20*1024*1024,
    })
    const file = acceptedFiles[0] || null;

    return (
        <div className="w-full gradient-border">
            <div {...getRootProps()}>
                <input {...getInputProps()} />
                <div className="space-y-4 cursor-pointer">
                    {file ? (
                        <div className="uploader-selected-file" onClick={(e)=>e.stopPropagation()}>
                            <div className="flex items-center space-x-3">
                                <img src="/images/pdf.png" alt={"pdf"} className="size-10" />
                                <div>
                                    <p className="text-sm text-gray-700 font-medium truncate max-w-xs">
                                        {file.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {formatSize(file.size)}
                                    </p>
                                </div>
                            </div>
                            <button className="p-2 cursor-pointer" onClick={(
                                onFileSelect?.(null)
                            )}>
                                <img src="/icons/cross.svg" alt="remove" className="w-4 h-4" />
                            </button>
                        </div>
                    ):(

                        <div>
                            <div className="mx-auto w-16 h-16 flex items-center justify-center">
                                <img src="/icons/info.svg" alt="upload" className="size-20"/>
                            </div>
                            <p className="text-lg text-gray-500"></p>
                            <span className="font-semibold">
                                Click to upload
                            </span> or drag and drop
                            <p className="text-lg text-gray-500">PDF (max 20MB)</p>
                        </div>

                    )}
                </div>
            </div>
        </div>
    )
}

export default FileUploader