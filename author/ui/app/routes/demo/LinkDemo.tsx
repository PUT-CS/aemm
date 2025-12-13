import { DemoContainer } from "~/routes/demo/DemoContainer";
import Link from "~/components/authoring/Link/Link";

export default function LinkDemo() {
  return (
    <DemoContainer title={"Only text"}>
      <Link text={"Click here"} />
    </DemoContainer>
  );
}
