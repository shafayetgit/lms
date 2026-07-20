"use client"

import React, { useRef, useState } from "react"
import { useParams } from "next/navigation"
import {
  Box,
  Grid,
  Typography,
  Button,
  Stack,
} from "@mui/material"
import {
  WorkspacePremium,
  DownloadOutlined,
} from "@mui/icons-material"
import { useSetBreadcrumb } from "@/hooks/useSetBreadcrumb"
import CPageLoader from "@/components/ui/CPageLoader"
import CError from "@/components/ui/CError"
import CModuleLayout from "@/components/ui/CModuleLayout"
import { useReadCertificateQuery } from "@/features/certificate/certificateApi"
import { useReadSettingsQuery } from "@/features/settings/settingsApi"
import dayjs from "dayjs"

export default function StudentCertificatePage() {
  const { id } = useParams()
  const printAreaRef = useRef(null)
  const [downloading, setDownloading] = useState(false)

  const { data: certRes, isLoading, isError } = useReadCertificateQuery(id, {
    refetchOnMountOrArgChange: true,
    skip: !id,
  })

  const { data: settingsData } = useReadSettingsQuery()

  const cert = certRes?.data

  const issuerName = cert?.template && cert.template !== "Default Template" ? cert.template : "EcoFin Institute"
  const boardName = cert?.template && cert.template !== "Default Template" ? `${cert.template} Academic Board` : "EcoFin Academic Board"

  useSetBreadcrumb("Certificate Details", `/academy/certificates/${id}`)

  const handleDownload = async () => {
    const certArea = document.getElementById("print-certificate-area")
    if (!certArea) return
    setDownloading(true)
    try {
      const html2canvas = (await import("html2canvas")).default
      const jsPDF = (await import("jspdf")).jsPDF
      const canvas = await html2canvas(certArea, { scale: 2, useCORS: true, backgroundColor: null })
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })
      const pdfW = pdf.internal.pageSize.getWidth()
      const pdfH = pdf.internal.pageSize.getHeight()
      pdf.addImage(imgData, "PNG", 0, 0, pdfW, pdfH)
      const fileName = `${cert.course?.title || cert.batch?.title || "certificate"}.pdf`
      pdf.save(fileName)
    } finally {
      setDownloading(false)
    }
  }

  if (isLoading) return <CPageLoader />
  if (isError || !cert) return <CError message="Certificate not found or unauthorized access" />

  return (
    <CModuleLayout>

      {/* Action Buttons Row */}
      <Stack direction="row" spacing={1.5} sx={{ mb: 3, justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<DownloadOutlined />}
          onClick={handleDownload}
          disabled={downloading}
          id="download_cert_btn"
          sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1 }}
        >
          {downloading ? "Generating PDF..." : "Download PDF"}
        </Button>
      </Stack>

      {/* A4 Landscape wrapper — scroll on small screens */}
      <Box sx={{ overflowX: "auto", width: "100%", pb: 2 }}>

      {/* Certificate Canvas — fixed A4 landscape: 297mm × 210mm */}
      <Box
        id="print-certificate-area"
        ref={printAreaRef}
        sx={{
          position: "relative",
          width: "297mm",
          height: "210mm",
          mx: "auto",
          background: "#faf9f6",
          border: "16px double #c5a880",
          borderRadius: "4px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          p: "40px 60px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "24px",
          textAlign: "center",
          overflow: "hidden",
        }}
      >
        {/* Corner flourishes */}
        <Box sx={{ position: "absolute", top: 15, left: 15, width: 40, height: 40, borderTop: "3px solid #c5a880", borderLeft: "3px solid #c5a880" }} />
        <Box sx={{ position: "absolute", top: 15, right: 15, width: 40, height: 40, borderTop: "3px solid #c5a880", borderRight: "3px solid #c5a880" }} />
        <Box sx={{ position: "absolute", bottom: 15, left: 15, width: 40, height: 40, borderBottom: "3px solid #c5a880", borderLeft: "3px solid #c5a880" }} />
        <Box sx={{ position: "absolute", bottom: 15, right: 15, width: 40, height: 40, borderBottom: "3px solid #c5a880", borderRight: "3px solid #c5a880" }} />

        {/* Header / Logo */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {(settingsData?.certificate_logo || settingsData?.site_logo_light || settingsData?.site_logo_dark) ? (
            <Box
              component="img"
              src={
                (settingsData.certificate_logo || settingsData.site_logo_light || settingsData.site_logo_dark).startsWith("http")
                  ? (settingsData.certificate_logo || settingsData.site_logo_light || settingsData.site_logo_dark)
                  : `${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/${(settingsData.certificate_logo || settingsData.site_logo_light || settingsData.site_logo_dark).replace(/^\//, "")}`
              }
              alt={issuerName}
              sx={{ height: { xs: 70, sm: 90, md: 110 }, objectFit: "contain", mb: 1 }}
            />
          ) : (
            <Typography
              variant="subtitle2"
              sx={{ fontFamily: "Outfit, sans-serif", letterSpacing: "0.2em", color: "#7a6b58", fontWeight: 600, textTransform: "uppercase", mb: 1 }}
            >
              {issuerName}
            </Typography>
          )}
          <Typography
            variant="h3"
            sx={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 700,
              color: "#3d3225",
              fontSize: { xs: "2rem", sm: "3rem", md: "3.8rem" },
              mb: 2,
            }}
          >
            Certificate of Completion
          </Typography>
        </Box>

        {/* Recipient details */}
        <Box>
          <Typography variant="body1" sx={{ fontFamily: "'Hind Siliguri', Outfit, sans-serif", fontStyle: "italic", color: "#7a6b58", mb: 1.5, fontSize: "1.1rem" }}>
            This is proudly presented to
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontFamily: "'Playfair Display', 'Hind Siliguri', Georgia, serif",
              fontWeight: 700,
              color: "#1c140c",
              borderBottom: "2px solid #e5d9c7",
              pb: 1,
              px: 4,
              display: "inline-block",
              fontSize: { xs: "1.8rem", sm: "2.6rem", md: "3.2rem" },
              mb: 2,
            }}
          >
            {cert.member?.full_name || cert.member?.email}
          </Typography>
          <Typography variant="body1" sx={{ fontFamily: "'Hind Siliguri', Outfit, sans-serif", color: "#7a6b58", maxWidth: "80%", mx: "auto", lineHeight: 1.6, fontSize: "1.05rem" }}>
            for successful completion and validation of all academic requirements for the course
          </Typography>
          <Typography
            variant="h5"
            sx={{ fontFamily: "'Hind Siliguri', Outfit, sans-serif", fontWeight: 800, color: "#3d3225", mt: 2, fontSize: { xs: "1.5rem", sm: "1.9rem", md: "2.2rem" } }}
          >
            {cert.course?.title || cert.batch?.title}
          </Typography>
        </Box>

        {/* Footer: Date | Seal | Signature */}
        <Box sx={{ width: "100%", mt: "auto" }}>
          <Grid container spacing={2} justifyContent="space-between" alignItems="center">
            <Grid size={{ xs: 4 }}>
              <Typography variant="body2" sx={{ fontFamily: "Outfit, sans-serif", fontWeight: 600, color: "#1c140c", borderBottom: "1px solid #c5a880", pb: 0.5, display: "inline-block", minWidth: 100 }}>
                {dayjs(cert.issue_date).format("MMMM D, YYYY")}
              </Typography>
              <Typography variant="caption" sx={{ display: "block", mt: 0.5, color: "#7a6b58", textTransform: "uppercase", fontSize: "0.7rem", letterSpacing: "0.1em" }}>
                Date of Issue
              </Typography>
            </Grid>

            <Grid size={{ xs: 4 }}>
              <Box sx={{ width: { xs: 60, sm: 80, md: 90 }, height: { xs: 60, sm: 80, md: 90 }, borderRadius: "50%", background: "radial-gradient(circle, #f3e5ab 0%, #d4af37 60%, #aa7c11 100%)", boxShadow: "0 4px 10px rgba(170,124,17,0.4)", mx: "auto", display: "flex", alignItems: "center", justifyContent: "center", border: "2px dashed #ffffff" }}>
                <WorkspacePremium sx={{ color: "#ffffff", fontSize: { xs: 30, sm: 40, md: 45 } }} />
              </Box>
            </Grid>

            <Grid size={{ xs: 4 }}>
              <Typography variant="body2" sx={{ fontFamily: "'Playfair Display', Georgia, serif", fontStyle: "italic", fontWeight: 600, color: "#1c140c", borderBottom: "1px solid #c5a880", pb: 0.5, display: "inline-block", minWidth: 100 }}>
                {boardName}
              </Typography>
              <Typography variant="caption" sx={{ display: "block", mt: 0.5, color: "#7a6b58", textTransform: "uppercase", fontSize: "0.7rem", letterSpacing: "0.1em" }}>
                Authorized Signature
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Verification ID */}
        <Box sx={{ mt: 3, pt: 1, borderTop: "1px solid #e5d9c7", width: "80%" }}>
          <Typography variant="caption" sx={{ fontFamily: "Outfit, sans-serif", color: "#a08e75", letterSpacing: "0.05em" }}>
            Verification ID: {cert.public_id} • Status: VERIFIED
          </Typography>
        </Box>
      </Box>

      </Box> {/* end A4 scroll wrapper */}

    </CModuleLayout>
  )
}
