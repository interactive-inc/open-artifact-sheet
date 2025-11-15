import { Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"

type Props = {
  isHome: boolean
}

/**
 * HomeButton
 */
export function HomeButton(props: Props) {
  return (
    <Link to={props.isHome ? "/tables" : "/"}>
      <Button className="rounded-full" size={"sm"}>
        <span>{props.isHome ? "設定" : "編集"}</span>
      </Button>
    </Link>
  )
}
