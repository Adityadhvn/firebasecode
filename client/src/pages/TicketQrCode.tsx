import { QRCodeCanvas } from "qrcode.react";



const TicketQRCode = ({ referenceNumber }: { referenceNumber: string }) => {
    return (
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-2">AHHAHAAH</h2>
        <QRCodeCanvas
          value={referenceNumber}
          size={200}
          bgColor="#ffffff"
          fgColor="#000000"
          level="H"
          includeMargin={true}
        />
      </div>
    );
  };

  export default TicketQRCode;