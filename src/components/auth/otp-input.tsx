"use client"

import { REGEXP_ONLY_DIGITS } from "input-otp"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

interface OtpInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function OtpInput({
  length = 6,
  value,
  onChange,
  disabled,
}: OtpInputProps) {
  return (
    <div className="flex justify-center">
      <InputOTP
        maxLength={length}
        pattern={REGEXP_ONLY_DIGITS}
        value={value}
        onChange={onChange}
        disabled={disabled}
        containerClassName="gap-2 sm:gap-3"
      >
        <InputOTPGroup className="gap-2 sm:gap-3">
          {Array.from({ length }).map((_, index) => (
            <InputOTPSlot
              key={index}
              index={index}
              className="h-12 w-10 sm:h-14 sm:w-12 text-lg font-semibold rounded-lg first:rounded-lg last:rounded-lg"
            />
          ))}
        </InputOTPGroup>
      </InputOTP>
    </div>
  )
}
