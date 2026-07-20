import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { usePathname } from "next/navigation"
import { setBreadcrumbLabel } from "@/features/app/appSlice"

// Reusable hook to set dynamic breadcrumb label for current route
export function useSetBreadcrumb(label, customPath) {
  const dispatch = useDispatch()
  const pathname = usePathname()

  useEffect(() => {
    const targetPath = customPath || pathname
    if (label && targetPath) {
      dispatch(setBreadcrumbLabel({ key: targetPath, label }))
    }
  }, [dispatch, pathname, customPath, label])
}
