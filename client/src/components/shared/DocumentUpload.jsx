import { useState } from 'react';
import api from '../../services/api';
import { FaCloudUploadAlt, FaSpinner } from 'react-icons/fa';

const DocumentUpload = ({ clientId, onUploadComplete }) => {
    const [file, setFile] = useState(null);
    const [description, setDescription] = useState('');
    const [type, setType] = useState('Invoice');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        formData.append('description', description);
        if (clientId) formData.append('clientId', clientId);

        setUploading(true);
        setError('');

        try {
            const { data } = await api.post('/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (data.success) {
                setFile(null);
                setDescription('');
                if (onUploadComplete) onUploadComplete();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-100">
            <h3 className="font-bold font-heading text-neutral-800 mb-4">Upload Document</h3>

            {error && <div className="text-danger-600 text-sm mb-3 bg-danger-50 p-2 rounded">{error}</div>}

            <form onSubmit={handleUpload} className="space-y-4">
                <div className="border-2 border-dashed border-neutral-200 rounded-lg p-6 text-center hover:border-primary-400 transition cursor-pointer relative bg-neutral-50/50">
                    <input
                        type="file"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center">
                        <FaCloudUploadAlt className="text-3xl text-primary-400 mb-2" />
                        <span className="text-sm font-medium text-neutral-600">
                            {file ? file.name : 'Click or Drag files here'}
                        </span>
                        <span className="text-xs text-neutral-400 mt-1">PDF, JPG, PNG up to 10MB</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="input-field text-sm"
                    >
                        <option>Invoice</option>
                        <option>Bank Statement</option>
                        <option>Notice</option>
                        <option>Challan</option>
                        <option>Other</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Reference / Note"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="input-field text-sm"
                    />
                </div>

                <button
                    type="submit"
                    disabled={!file || uploading}
                    className="w-full btn-primary py-2 text-sm justify-center"
                >
                    {uploading ? <FaSpinner className="animate-spin" /> : 'Upload File'}
                </button>
            </form>
        </div>
    );
};

export default DocumentUpload;
