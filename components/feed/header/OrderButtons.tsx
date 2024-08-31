import { useRouter } from "next/router"
import React from "react"
import { TbSortDescending, TbSortAscending } from "react-icons/tb"

type TOrder = "asc" | "desc"

type Props = {}

const OrderButtons: React.FC<Props> = () => {
    const router = useRouter()

    const currentOrder = `${router.query.order || ``}` || ("desc" as TOrder)

    const handleClickOrderBy = (value: TOrder) => {
        router.push({
            query: {
                ...router.query,
                order: value,
            },
        })
    }

    return (
        <div className="flex gap-2 p-1 bg-gray-200 rounded-md">
            <a
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                    currentOrder === "desc"
                        ? "bg-background text-foreground shadow"
                        : "text-gray-700"
                }`}
                onClick={() => handleClickOrderBy("desc")}
            >
                <TbSortDescending size="17" className="mr-2" /> Desc
            </a>
            <a
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                    currentOrder === "asc"
                        ? "bg-background text-foreground shadow"
                        : "text-gray-700"
                }`}
                onClick={() => handleClickOrderBy("asc")}
            >
                <TbSortAscending size="17" className="mr-2" /> Asc
            </a>
        </div>
    )
}

export default OrderButtons
