import React from "react"

export default function CourseLayout({ children, Navigation }) {
  return (
    <>
      {Navigation}
      {children}
    </>
  )
}
