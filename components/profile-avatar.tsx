"use client"

import React, { useRef, useState, useEffect } from "react"
import { Camera, X } from "lucide-react"

interface ProfileAvatarProps {
  userId: string | number
  name: string
  className?: string
  size?: number // px
  readonly?: boolean
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0]?.toUpperCase() || "")
    .join("")
    .slice(0, 2)
}

const AVATAR_KEY_PREFIX = "profile-avatar-"

export default function ProfileAvatar({ userId, name, className = "", size = 96, readonly = false }: ProfileAvatarProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [image, setImage] = useState<string | null>(null)

  // Helper to get the avatar key
  const avatarKey = AVATAR_KEY_PREFIX + userId

  // Listen for localStorage changes (cross-tab and custom event for same tab)
  useEffect(() => {
    const updateImage = () => {
      const stored = localStorage.getItem(avatarKey)
      setImage(stored)
    }
    updateImage()
    const onStorage = (e: StorageEvent) => {
      if (e.key === avatarKey) updateImage()
    }
    const onCustom = (e: Event) => {
      if ((e as CustomEvent).detail === avatarKey) updateImage()
    }
    window.addEventListener("storage", onStorage)
    window.addEventListener("profile-avatar-updated", onCustom)
    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("profile-avatar-updated", onCustom)
    }
  }, [avatarKey])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const result = ev.target?.result as string
        setImage(result)
        localStorage.setItem(avatarKey, result)
        // Dispatch custom event for same-tab updates
        window.dispatchEvent(new CustomEvent("profile-avatar-updated", { detail: avatarKey }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemove = () => {
    setImage(null)
    localStorage.removeItem(avatarKey)
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new CustomEvent("profile-avatar-updated", { detail: avatarKey }))
  }

  return (
    <div className={`relative flex flex-col items-center ${className}`} style={{ width: size, height: size }}>
      <div
        className="rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-300"
        style={{ width: size, height: size, position: "relative" }}
      >
        {image ? (
          <img
            src={image}
            alt="Profile"
            className="object-cover w-full h-full"
            style={{ borderRadius: "50%" }}
          />
        ) : (
          <span className="text-3xl font-bold text-gray-600 select-none">
            {getInitials(name)}
          </span>
        )}
        {!readonly && (
          <>
            <button
              type="button"
              className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow hover:bg-gray-100 border border-gray-300"
              title="Upload profile picture"
              onClick={() => inputRef.current?.click()}
              style={{ zIndex: 2 }}
            >
              <Camera className="h-5 w-5 text-gray-700" />
            </button>
            {image && (
              <button
                type="button"
                className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:bg-gray-100 border border-gray-300"
                title="Remove profile picture"
                onClick={handleRemove}
                style={{ zIndex: 2 }}
              >
                <X className="h-4 w-4 text-gray-700" />
              </button>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </>
        )}
      </div>
    </div>
  )
}