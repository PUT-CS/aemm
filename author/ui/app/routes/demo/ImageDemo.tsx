import { Image } from "~/components/authoring/Image/Image";
import { DemoContainer } from "./DemoContainer";

export default function ImageDemo() {
  return (
    <>
      <DemoContainer title={"Basic Image"}>
        <Image
          src="https://picsum.photos/400/300"
          alt="Random placeholder image"
        />
      </DemoContainer>
      <DemoContainer title={"Image with Fixed Dimensions"}>
        <Image
          src="https://picsum.photos/800/600"
          alt="Fixed size image"
          width={400}
          height={300}
        />
      </DemoContainer>
      <DemoContainer title={"Rounded Image"}>
        <Image
          src="https://picsum.photos/400/400"
          alt="Rounded image"
          width={300}
          height={300}
          rounded={true}
        />
      </DemoContainer>
      <DemoContainer title={"Object Fit: Cover"}>
        <div className="w-full h-64 border">
          <Image
            src="https://picsum.photos/800/600"
            alt="Cover fit image"
            objectFit="cover"
            className="w-full h-full"
          />
        </div>
      </DemoContainer>
      <DemoContainer title={"Object Fit: Contain"}>
        <div className="w-full h-64 border bg-gray-100">
          <Image
            src="https://picsum.photos/800/600"
            alt="Contain fit image"
            objectFit="contain"
            className="w-full h-full"
          />
        </div>
      </DemoContainer>
      <DemoContainer title={"Custom Styling"}>
        <Image
          src="https://picsum.photos/600/400"
          alt="Custom styled image"
          width={400}
          height={267}
          rounded={true}
          className="shadow-lg border-4 border-primary"
        />
      </DemoContainer>
      <DemoContainer title={"Eager Loading"}>
        <Image
          src="https://picsum.photos/500/300"
          alt="Eagerly loaded image"
          width={400}
          height={240}
          loading="eager"
        />
      </DemoContainer>

      <div className="mt-16 mb-8">
        <h3 className="text-2xl font-bold mb-4">Lazy Loading Demo</h3>
        <p className="text-muted-foreground mb-6">
          Scroll down to see these images load only when they come into view.
          Open your browser's Network tab to see them loading as you scroll.
        </p>
      </div>

      <DemoContainer title={"Lazy Image 1"}>
        <Image
          src="https://picsum.photos/seed/lazy1/800/600"
          alt="Lazy loaded image 1"
          width={600}
          height={450}
        />
      </DemoContainer>

      <DemoContainer title={"Lazy Image 2"}>
        <Image
          src="https://picsum.photos/seed/lazy2/800/600"
          alt="Lazy loaded image 2"
          width={600}
          height={450}
          rounded={true}
        />
      </DemoContainer>

      <DemoContainer title={"Lazy Image 3"}>
        <Image
          src="https://picsum.photos/seed/lazy3/800/600"
          alt="Lazy loaded image 3"
          width={600}
          height={450}
        />
      </DemoContainer>

      <DemoContainer title={"Lazy Image 4"}>
        <Image
          src="https://picsum.photos/seed/lazy4/800/600"
          alt="Lazy loaded image 4"
          width={600}
          height={450}
          rounded={true}
          objectFit="cover"
          className="shadow-lg"
        />
      </DemoContainer>

      <DemoContainer title={"Lazy Image 5"}>
        <Image
          src="https://picsum.photos/seed/lazy5/800/600"
          alt="Lazy loaded image 5"
          width={600}
          height={450}
        />
      </DemoContainer>
    </>
  );
}
