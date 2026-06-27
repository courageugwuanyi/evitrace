import { Camera, ShieldCheck } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useUploadAvatar } from "@/lib/api/profile";
import { getDisplayName } from "@/features/home/shared/text-utils";
import { C, Card, Field, Input } from "@/features/home/shared/ui-kit";

type ProfileTeamDraft = {
  fullName: string;
  email: string;
  currentLevel: string;
  targetLevel: string;
  manager: string;
  managerEmail: string;
  team: string;
  skipLevel: string;
};

export function ProfileSettings({
  draft,
  onChange,
}: {
  draft: ProfileTeamDraft;
  onChange: (next: Partial<ProfileTeamDraft>) => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const { userId } = useAuth();
  const uploadAvatarMutation = useUploadAvatar(userId ?? "");
  const [photo, setPhoto] = useState<string | null>(null);
  const { user } = useAuth();
  const displayName = getDisplayName(draft.fullName, draft.email);
  const displayTitle = user?.currentLevel?.trim() || "Engineer";
  const displaySubtitle = user?.team ? `${displayTitle} · ${user.team}` : displayTitle;
  const profileInitials =
    displayName
      .split(" ")
      .map((segment) => segment[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "US";
  if (!user) return null;

  useEffect(() => {
    if (user?.avatarUrl) setPhoto(user.avatarUrl);
  }, [user?.avatarUrl]);

  function onPickPhoto(file: File | null | undefined) {
    if (!file) return;
    uploadAvatarMutation.mutate(file, {
      onSuccess: (url) => {
        setPhoto(url);
        toast.success("Profile picture updated");
      },
    });
  }

  return (
    <Card className="p-6">
      <div>
        <h3 className="text-base font-bold tracking-tight" style={{ color: C.navy }}>
          Profile
        </h3>
        <p className="text-xs mt-1" style={{ color: C.subtle }}>
          Your personal information and role
        </p>
      </div>
      <div className="mt-5 flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="relative group w-16 h-16 rounded-full overflow-hidden focus:outline-none focus-visible:ring-2"
          style={{ background: "#5243AA" }}
          aria-label="Change profile photo"
        >
          {photo ? (
            <img src={photo} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-lg font-semibold text-white">
              {profileInitials}
            </span>
          )}
          <span
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: "rgba(9,30,66,0.55)" }}
          >
            <Camera size={18} color="#fff" />
          </span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => onPickPhoto(event.target.files?.[0])}
        />
        <div className="min-w-0">
          <div className="text-base font-semibold" style={{ color: C.navy }}>
            {displayName}
          </div>
          <div className="text-sm" style={{ color: C.subtle }}>
            {displaySubtitle}
          </div>
        </div>
      </div>
      <div className="mt-4 text-xs flex items-center gap-1.5" style={{ color: C.subtle }}>
        <ShieldCheck size={12} />
        Identity fields are protected. You'll be asked to confirm your password before saving.
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <Field label="Full name">
          <Input value={draft.fullName} onChange={(event) => onChange({ fullName: event.target.value })} />
        </Field>
        <Field label="Email">
          <Input
            type="email"
            value={draft.email}
            onChange={(event) => onChange({ email: event.target.value })}
          />
        </Field>
        <Field label="Current Job Title / Level">
          <Input value={draft.currentLevel} onChange={(event) => onChange({ currentLevel: event.target.value })} />
        </Field>
        <Field label="Target level">
          <Input value={draft.targetLevel} onChange={(event) => onChange({ targetLevel: event.target.value })} />
        </Field>
        <Field label="Business unit / Team">
          <Input value={draft.team} onChange={(event) => onChange({ team: event.target.value })} />
        </Field>
      </div>
    </Card>
  );
}
