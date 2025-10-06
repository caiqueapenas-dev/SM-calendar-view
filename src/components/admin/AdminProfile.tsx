"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAppStore } from "@/store/appStore";
import { User, Camera, Save, X } from "lucide-react";
import Image from "next/image";

interface AdminProfileData {
  id: string;
  name: string;
  profile_picture_url: string | null;
}

export default function AdminProfile() {
  const { user } = useAppStore();
  const [profile, setProfile] = useState<AdminProfileData>({
    id: "",
    name: "",
    profile_picture_url: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("admin_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      setProfile(data);
    } else {
      // Create default profile
      setProfile({
        id: user.id,
        name: user.email?.split("@")[0] || "Admin",
        profile_picture_url: null,
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `admin-profiles/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("posts-media")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("posts-media")
        .getPublicUrl(filePath);

      setProfile((prev) => ({ ...prev, profile_picture_url: data.publicUrl }));
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Erro ao fazer upload da imagem");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("admin_profiles")
        .upsert({
          id: user.id,
          name: profile.name,
          profile_picture_url: profile.profile_picture_url,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      alert("Perfil atualizado com sucesso!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Erro ao salvar perfil");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-start gap-6">
        {/* Profile Picture */}
        <div className="relative group">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center">
            {profile.profile_picture_url ? (
              <img
                src={profile.profile_picture_url}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={40} className="text-gray-400" />
            )}
          </div>
          {isEditing && (
            <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={24} className="text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={isUploading}
              />
            </label>
          )}
        </div>

        {/* Profile Info */}
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">
                  Nome
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  <Save size={16} />
                  {isSaving ? "Salvando..." : "Salvar"}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    fetchProfile();
                  }}
                  className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                >
                  <X size={16} />
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="text-xl font-semibold text-white mb-1">
                {profile.name}
              </h3>
              <p className="text-gray-400 text-sm mb-4">{user?.email}</p>
              <button
                onClick={() => setIsEditing(true)}
                className="text-indigo-400 hover:text-indigo-300 text-sm"
              >
                Editar perfil
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

