import { Navigate, useParams } from "react-router-dom"
import { useEffect, useRef, type JSX } from "react"
import { useSurveyStore } from "../stores/SurveyStore"

interface Props {
    children: JSX.Element
}

export default function SurveyWrapper({ children }: Props) {
  const { surveyData, userId, isLoading, fetchSurvey } = useSurveyStore()
  const params = useParams()
  const isFetched = useRef<boolean>(false)

  useEffect(() => {
    if (isFetched.current) return
    
    fetchSurvey(params.id)

    isFetched.current = true
  }, [params.id, isFetched])

  if (isLoading || !isFetched) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--color-base-100)]">
        <div className="loader w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (userId !== surveyData.authorId) {
    return <Navigate to="/" />
  }

  return children
}