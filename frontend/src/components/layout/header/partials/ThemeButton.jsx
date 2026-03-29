

// import { useRouter } from "next/navigation";
// import { useDispatch } from "react-redux";
// import { removeCredentials } from "@/apps/user/auth/authSlice";
// import { useSignOutMutation } from "@/apps/user/auth/authApiSlice";
import CButton from "@/components/CButton";

export default function SignOut() {
  // const [signOut] = useSignOutMutation();
  // const dispatch = useDispatch();
  // const router = useRouter();

  // const handleSignOut = async () => {
  //   await signOut().unwrap();
  //   dispatch(removeCredentials());
  //   router.push("/user/auth/sign-in"); // Redirect to sign-in page
  // };

  return (
    <CButton
      label="Sign Out"
      aria-label="Sign Out"
      sx={{ fontWeight: "bold" }}
      // onClick={handleSignOut}
    />
  );
}
