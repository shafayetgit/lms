import api from "@/redux/api"

const PREFIX = "api/v1/statistics"

const statisticsAPI = api.injectEndpoints({
  endpoints: builder => ({
    readStatistics: builder.query({
      query: () => `${PREFIX}`,
      providesTags: ["STATISTICS"],
    }),
  }),
  overrideExisting: false,
})

export const { useReadStatisticsQuery, useLazyReadStatisticsQuery } = statisticsAPI
export default statisticsAPI
