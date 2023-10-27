export function readVideoFileAsBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = event => {
            const result = event.target?.result as ArrayBuffer;
            resolve(result);
        };

        reader.onerror = event => {
            reject(event.target?.error);
        };

        reader.readAsArrayBuffer(file);
    });
}
