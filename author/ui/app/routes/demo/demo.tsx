import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import TextDemo from "~/routes/demo/TextDemo";

export function meta() {
  return [
    { title: "Demo | AEMM" },
    { name: "description", content: "Internal demos of authoring components" },
  ];
}

export default function Demo() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <Accordion
        type="single"
        collapsible
        className="w-full"
        defaultValue="item-1"
      >
        <AccordionItem value="item-1">
          <AccordionTrigger className="py-6 text-lg [&>svg]:size-5">
            Text
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <TextDemo />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
