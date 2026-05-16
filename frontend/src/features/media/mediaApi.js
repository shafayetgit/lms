import api from "@/redux/api";

const PREFIX = "api/v1/media";

const mediaAPI = api.injectEndpoints({
  endpoints: (builder) => ({
    attach: builder.mutation({
      query: (body) => ({
        url: `${PREFIX}/attach`,
        method: "POST",
        body: body,
      }),
      invalidatesTags: ["MEDIA"],
    }),
  }),
  overrideExisting: false,
});

export const { useAttachMutation } = mediaAPI;
export default mediaAPI;
