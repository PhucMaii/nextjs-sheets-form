import StatusText from "../admin/components/StatusText"
import { USER_CATEGORIZED } from "../utils/enum"
import { userCategorizedColor } from "./constant"

export const renderType = (type: USER_CATEGORIZED) => {
    return (
      <StatusText
        type={userCategorizedColor[type]?.color}
        backgroundColor={userCategorizedColor[type]?.backgroundColor}
        text={type}
      />
    )
}