package com.example.back_end.WebScrap;

public class DanfeResponse {
    private byte[] xmlBytes;
    private byte[] pdfBytes;

    public DanfeResponse(byte[] xmlBytes, byte[] pdfByte){
        this.xmlBytes = xmlBytes;
        this.pdfBytes = pdfByte;
    }

    public byte[] getXmlBytes() {
        return xmlBytes;
    }

    public byte[] getPdfBytes() {
        return pdfBytes;
    }
}