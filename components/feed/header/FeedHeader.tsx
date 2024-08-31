import React from "react"
import CategorySelect from "./CategorySelect"
import OrderButtons from "./OrderButtons"
import { Separator } from "@/components/ui/separator";

type Props = {}

const FeedHeader: React.FC<Props> = () => {
  return (
      <div className="flex flex-wrap mb-4">
          <CategorySelect />
          <div className="ms-auto content-end mb-2">
            <OrderButtons />
          </div>
          <Separator />
      </div>
  )
}

export default FeedHeader