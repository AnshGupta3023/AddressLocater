"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp"
import { Loader2, ShieldCheck, Phone } from "lucide-react"

interface OTPVerificationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  phoneNumber: string
  onVerifySuccess: () => void
  onResendOTP?: () => Promise<void>
}

export function OTPVerificationDialog({
  open,
  onOpenChange,
  phoneNumber,
  onVerifySuccess,
  onResendOTP,
}: OTPVerificationDialogProps) {
  const [otp, setOtp] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState("")
  const [resendTimer, setResendTimer] = useState(30)
  const [canResend, setCanResend] = useState(false)

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setOtp("")
      setError("")
      setResendTimer(30)
      setCanResend(false)
    }
  }, [open])

  // Countdown timer for resend
  useEffect(() => {
    if (!open) return

    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [open])

  // Mask phone number for display
  const maskedPhone = useCallback(() => {
    if (!phoneNumber) return ""
    const cleaned = phoneNumber.replace(/\D/g, "")
    if (cleaned.length < 4) return phoneNumber
    const lastFour = cleaned.slice(-4)
    const masked = "*".repeat(Math.max(0, cleaned.length - 4))
    return `${masked}${lastFour}`
  }, [phoneNumber])

  // Handle OTP verification
  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit OTP")
      return
    }

    setIsVerifying(true)
    setError("")

    try {
      // Simulate OTP verification API call
      // In production, replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // For demo: accept any 6-digit OTP or specific codes
      // In production, verify against backend
      const validOTPs = ["123456", "000000"]
      if (validOTPs.includes(otp) || otp.length === 6) {
        onVerifySuccess()
        onOpenChange(false)
      } else {
        setError("Invalid OTP. Please try again.")
      }
    } catch {
      setError("Verification failed. Please try again.")
    } finally {
      setIsVerifying(false)
    }
  }

  // Handle resend OTP
  const handleResend = async () => {
    setIsSending(true)
    setError("")

    try {
      if (onResendOTP) {
        await onResendOTP()
      } else {
        // Simulate sending OTP
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      // Reset timer
      setResendTimer(30)
      setCanResend(false)
      setOtp("")
    } catch {
      setError("Failed to resend OTP. Please try again.")
    } finally {
      setIsSending(false)
    }
  }

  // Auto-submit when OTP is complete
  useEffect(() => {
    if (otp.length === 6 && !isVerifying) {
      handleVerify()
    }
  }, [otp])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-7 w-7 text-primary" />
          </div>
          <DialogTitle className="text-xl">Verify Your Phone</DialogTitle>
          <DialogDescription className="pt-2">
            We&apos;ve sent a 6-digit verification code to
          </DialogDescription>
          <div className="flex items-center justify-center gap-2 pt-1">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-foreground">{maskedPhone()}</span>
          </div>
        </DialogHeader>

        <div className="py-6">
          {/* OTP Input */}
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => {
                setOtp(value)
                setError("")
              }}
              disabled={isVerifying}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          {/* Error Message */}
          {error && (
            <p className="mt-3 text-center text-sm text-destructive">{error}</p>
          )}

          {/* Resend OTP */}
          <div className="mt-4 text-center">
            {canResend ? (
              <Button
                variant="link"
                size="sm"
                onClick={handleResend}
                disabled={isSending}
                className="text-primary"
              >
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Resend OTP"
                )}
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Resend OTP in{" "}
                <span className="font-medium text-foreground">
                  {resendTimer}s
                </span>
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isVerifying}
          >
            Cancel
          </Button>
          <Button onClick={handleVerify} disabled={otp.length !== 6 || isVerifying}>
            {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Verify
          </Button>
        </DialogFooter>

        {/* Demo hint */}
        <p className="text-xs text-center text-muted-foreground border-t pt-4">
          Demo: Enter any 6 digits to verify
        </p>
      </DialogContent>
    </Dialog>
  )
}
