import { createApi } from "@reduxjs/toolkit/query/react";
import baseQuery from "../baseQuery";

const PREFIX = "api/v1/categories";

const categoryAPI = createApi({
  reducerPath: "category.api",
  baseQuery: baseQuery,
  endpoints: (builder) => ({
    create: builder.mutation({
      query: (body) => ({
        url: `${PREFIX}/create`,
        method: "POST",
        body,
      }),
    }),

    list: builder.query({
      query: ({ type='', size, page, term }) => {
        const params = new URLSearchParams();

        if (term) params.set("term", term);
        if (type) params.set("type", type);
        if (page !== undefined) params.set("page", page);
        if (size !== undefined) params.set("size", size);

        const queryString = params.toString();
        return queryString ? `${PREFIX}/?${queryString}` : PREFIX;
      },
    }),
  }),
});

export const { useCreateMutation, useListQuery, useLazyListQuery } = categoryAPI;
export default categoryAPI;
