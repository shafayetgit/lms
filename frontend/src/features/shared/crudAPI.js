import api from "@/redux/api";

const PREFIX = "api/v1/crud";

const crudAPI = api.injectEndpoints({
  endpoints: (builder) => ({
    delete: builder.mutation({
      query: (body) => ({
        url: `${PREFIX}/delete`,
        method: "DELETE",
        body: body,
      }),
      invalidatesTags: (result, error, arg) => {
        // Accept invalidateTag from request body to invalidate tags from other slices
        return arg.invalidateTag ? [arg.invalidateTag] : [];
      },
    }),
  }),
  overrideExisting: false,
});

export const { useDeleteMutation } = crudAPI;
export default crudAPI;

/**
 * Usage:
 * Pass invalidateTag in the request body to invalidate tags from other slices
 *
 * From courses:
 * await deleteApi({ id: 123, invalidateTag: "COURSES" });
 *
 * From ebooks:
 * await deleteApi({ id: 456, invalidateTag: "EBOOKS" });
 *
 * From orders:
 * await deleteApi({ id: 789, invalidateTag: "ORDERS" });
 */
