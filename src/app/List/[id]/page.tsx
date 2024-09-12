"use client"
import { useParams } from "next/navigation"

const ToDoHome = () => {
    const {id} = useParams()

    console.log(id)
    return(
        <h1>{id}</h1>
    )
}

export default ToDoHome