import { toast } from "react-toastify"
import CButton from "@/components/ui/CButton"
import { Delete } from "@mui/icons-material"
import { useDeleteMutation } from "@/features/shared/crudAPI"

/**
 * CDelete Component - Delete action button with confirmation and cache invalidation
 * 
 * @param {Object} values - The request payload (model, filters, etc.)
 * @param {string} invalidateTag - The tag to invalidate after successful deletion
 * @param {string} label - Button label/tooltip (default: "Delete")
 * 
 * @example
 * // From courses page
 * <CDelete 
 *   values={{ 
 *     model: "courses",
 *     filters: [{ field: "id", operator: "eq", value: "123" }]
 *   }}
 *   invalidateTag="COURSES"
 * />
 * 
 * @example
 * // From ebooks page
 * <CDelete 
 *   values={{ 
 *     model: "ebooks",
 *     filters: [{ field: "id", operator: "eq", value: "456" }]
 *   }}
 *   invalidateTag="EBOOKS"
 *   label="Remove"
 * />
 */
export default function CDelete({
  values,
  invalidateTag,
  label = "Delete",
}) {
  const [destroy, { isLoading }] = useDeleteMutation()

  const handleDelete = async () => {
    try {
      const payload = {
        ...values,
        ...(invalidateTag && { invalidateTag }),
      }
      const response = await destroy(payload).unwrap()
      toast.success(response?.message)
    } catch (error) {
      console.error("Error while deleting:", error)
      toast.error(error?.data?.message || "Something went wrong")
    }
  }

  return (
    <CButton
      tooltip={label}
      label={label}
      yesNo
      iconButton
      icon={<Delete color="error" />}
      onClick={handleDelete}
      loading={isLoading}
    />
  )
}
