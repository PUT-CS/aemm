import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import TextDemo from "~/routes/demo/TextDemo";
import ImageDemo from "~/routes/demo/ImageDemo";
import LinkDemo from "~/routes/demo/LinkDemo";

export function meta() {
  return [
    { title: "Demo | AEMM" },
    { name: "description", content: "Internal demos of authoring components" },
  ];
}

export default function Demo() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="text">
          <AccordionTrigger className="py-6 text-lg [&>svg]:size-5">
            Text
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 text-balance">
            <TextDemo />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="image">
          <AccordionTrigger className="py-6 text-lg [&>svg]:size-5">
            Image
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4">
            <ImageDemo />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="button">
          <AccordionTrigger className="py-6 text-lg [&>svg]:size-5">
            Button
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4">
            <LinkDemo />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
