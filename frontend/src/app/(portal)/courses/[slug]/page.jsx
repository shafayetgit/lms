import CourseClient from "./CourseClient"

export async function generateMetadata({ params }) {
  // Await params for Next.js 15+ compatibility
  const resolvedParams = await Promise.resolve(params)
  const slug = resolvedParams?.slug

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000"

    // Fetch course details on the server to generate SEO tags
    const res = await fetch(`${baseUrl}/api/v1/courses/${slug}?is_portal=true`, {
      cache: "no-store", // Ensures we always get fresh course data for SEO
    })

    const data = await res.json()
    const course = data?.data

    if (!course) {
      return {
        title: "Course Not Found",
        description: "The requested course does not exist.",
      }
    }

    // Default site name (Could ideally be fetched from a global settings API)
    const siteName = "ecoFin Institute"
    const courseTitle = `${course.title} | ${siteName}`
    const courseDescription =
      course.short_introduction || `Enroll in ${course.title} and start learning today.`

    return {
      title: courseTitle,
      description: courseDescription,
      openGraph: {
        title: course.title,
        description: courseDescription,
        siteName: siteName,
        type: "website",
        images: course.thumbnail
          ? [
              {
                url: course.thumbnail,
                width: 1200,
                height: 630,
                alt: course.title,
              },
            ]
          : [],
      },
      twitter: {
        card: "summary_large_image",
        title: course.title,
        description: courseDescription,
        images: course.thumbnail ? [course.thumbnail] : [],
      },
    }
  } catch (error) {
    return {
      title: "Course Details",
      description: "Explore our premium courses and start learning today.",
    }
  }
}

export default function CourseServerPage(props) {
  return <CourseClient />
}
