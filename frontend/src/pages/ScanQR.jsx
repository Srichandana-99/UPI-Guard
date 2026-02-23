import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { ChevronLeft, QrCode } from 'lucide-react';

export function ScanQR() {
    const navigate = useNavigate();
    const [scanResult, setScanResult] = useState(null);

    useEffect(() => {
        // Initialize the scanner when the component mounts
        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            false
        );

        scanner.render(onScanSuccess, onScanFailure);

        function onScanSuccess(decodedText, decodedResult) {
            setScanResult(decodedText);
            scanner.clear(); // Stop scanning after success

            // Redirect to send money page with the scanned UPI ID
            // In a real app, you'd want to parse the UPI string to get the ID properly
            const upiMatch = decodedText.match(/(?:pa=)([^&]+)/);
            if (upiMatch && upiMatch[1]) {
                navigate('/send', { state: { scannedUpiId: upiMatch[1] } });
            } else {
                navigate('/send', { state: { scannedUpiId: decodedText } });
            }
        }

        function onScanFailure(error) {
            // handle scan failure, usually better to ignore and keep scanning
            // console.warn(`Code scan error = ${error}`);
        }

        // Cleanup when component unmounts
        return () => {
            scanner.clear().catch(error => console.error("Failed to clear scanner", error));
        };
    }, [navigate]);

    return (
        <div className="min-h-screen bg-secure-bg text-secure-text p-6 flex flex-col items-center">
            {/* Header */}
            <div className="w-full max-w-md flex items-center justify-between mb-8">
                <button onClick={() => navigate(-1)} className="w-10 h-10 bg-[#12101B] border border-[#232332] rounded-full flex items-center justify-center hover:bg-[#1A1825] transition-colors">
                    <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <h1 className="text-lg font-bold">Scan QR</h1>
                <div className="w-10 h-10" /> {/* Spacer for centering */}
            </div>

            <div className="w-full max-w-md flex-1 flex flex-col justify-center items-center">
                <div className="mb-8 text-center">
                    <div className="w-16 h-16 bg-secure-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <QrCode className="w-8 h-8 text-secure-blue" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Scan to Pay</h2>
                    <p className="text-secure-textMuted text-sm">Align the QR code within the frame to scan</p>
                </div>

                {/* Scanner Container */}
                <div className="w-full bg-[#12101B] border border-[#232332] rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                    <div id="reader" className="w-full rounded-2xl overflow-hidden [&>video]:rounded-2xl [&>#reader__dashboard]:bg-[#12101B] [&>#reader__dashboard]:text-white"></div>

                    {/* Visual corners using absolute positioning */}
                    <div className="absolute top-6 left-6 w-8 h-8 border-t-4 border-l-4 border-secure-blue rounded-tl-xl pointer-events-none"></div>
                    <div className="absolute top-6 right-6 w-8 h-8 border-t-4 border-r-4 border-secure-blue rounded-tr-xl pointer-events-none"></div>
                    <div className="absolute bottom-6 left-6 w-8 h-8 border-b-4 border-l-4 border-secure-blue rounded-bl-xl pointer-events-none"></div>
                    <div className="absolute bottom-6 right-6 w-8 h-8 border-b-4 border-r-4 border-secure-blue rounded-br-xl pointer-events-none"></div>
                </div>

                {scanResult && (
                    <div className="mt-8 bg-[#0D1A15] border border-[#14261E] rounded-xl p-4 w-full">
                        <p className="text-[#00D06C] text-sm text-center font-bold">Code Scanned Successfully!</p>
                        <p className="text-[#8A8A9E] text-xs text-center mt-1 truncate">{scanResult}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
