/**
 * Buffer polyfill for browser environments
 * 
 * This is needed because some Node.js libraries might reference the Buffer global,
 * which is not available in browser environments
 */

// Create a simple Buffer function to match Node.js interface
function BufferFunction() {
  // Empty constructor
}

// Add static methods to the Buffer function
BufferFunction.from = function(data: any, encodingOrOffset?: string | number, length?: number): Uint8Array {
  // Handle string inputs
  if (typeof data === 'string') {
    const encoder = new TextEncoder();
    return encoder.encode(data);
  }
  
  // Handle array-like objects
  if (Array.isArray(data) || data instanceof Uint8Array) {
    return new Uint8Array(data);
  }
  
  // Handle ArrayBuffer
  if (data instanceof ArrayBuffer) {
    return new Uint8Array(data);
  }
  
  // For all other types, return an empty buffer with warning
  console.warn('BufferPolyfill: Unsupported data type:', typeof data);
  return new Uint8Array();
};

BufferFunction.isBuffer = function(obj: any): boolean {
  return obj instanceof Uint8Array;
};

BufferFunction.alloc = function(size: number, fill?: number): Uint8Array {
  const buffer = new Uint8Array(size);
  if (fill !== undefined) {
    buffer.fill(fill);
  }
  return buffer;
};

// Only define Buffer globally if it doesn't exist already
if (typeof window !== 'undefined' && typeof (window as any).Buffer === 'undefined') {
  (window as any).Buffer = BufferFunction;
  
  // Add toString method to Uint8Array prototype to simulate Buffer behavior
  if (!Uint8Array.prototype.hasOwnProperty('toString')) {
    Object.defineProperty(Uint8Array.prototype, 'toString', {
      value: function(encoding?: string): string {
        const decoder = new TextDecoder();
        return decoder.decode(this);
      },
      enumerable: false,
      configurable: true,
      writable: true
    });
  }
}

export default BufferFunction;