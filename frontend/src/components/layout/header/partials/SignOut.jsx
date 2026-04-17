

// import { useRouter } from "next/navigation";
// import { useDispatch } from "react-redux";
// import { removeCredentials } from "@/apps/user/auth/authSlice";
// import { useSignOutMutation } from "@/apps/user/auth/authApiSlice";
import CButton from "@/components/ui/CButton";
import { removeAuthCookie } from "@/lib/auth/cookie";
import { toast } from "react-toastify";

export default function SignOut({ fullWidth }) {
  const handleSignOut = async () => {
    try {
      removeAuthCookie();
      toast.success("Signed out successfully");
      window.location.href = "/";
    } catch (error) {
      toast.error("Sign out failed");
    }
  };

  return (
    <CButton
      label="Sign Out"
      aria-label="Sign Out"
      fullWidth={fullWidth}
      sx={{ fontWeight: "bold" }}
      onClick={handleSignOut}
    />
  );
}
