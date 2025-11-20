import { Container } from "~/components/authoring/Container/Container";
import { Text } from "~/components/authoring/Text/Text";
import { Image } from "~/components/authoring/Image/Image";
import { DemoContainer } from "~/routes/demo/DemoContainer";

export default function ContainerDemo() {
  return (
    <>
      <DemoContainer title="Vertical Stack (Default)">
        <Container direction="vertical" gap={16}>
          <Text text="<h3>First Item</h3>" />
          <Text text="<p>This is the second item in a vertical stack.</p>" />
          <Text text="<p>And this is the third item.</p>" />
        </Container>
      </DemoContainer>

      <DemoContainer title="Horizontal Stack">
        <Container direction="horizontal" gap={24}>
          <Text text="<strong>Item 1</strong>" />
          <Text text="<strong>Item 2</strong>" />
          <Text text="<strong>Item 3</strong>" />
        </Container>
      </DemoContainer>

      <DemoContainer title="Horizontal with Center Alignment">
        <Container
          direction="horizontal"
          gap={16}
          align="center"
          justify="center"
        >
          <Image
            src="https://placehold.co/100x100"
            alt="Demo image 1"
            width={100}
            height={100}
            rounded={true}
          />
          <Text text="<p>Centered content next to an image</p>" />
        </Container>
      </DemoContainer>

      <DemoContainer title="Vertical with Gap Control">
        <Container direction="vertical" gap={32}>
          <Text text="<h4>Large Gap</h4>" />
          <Text text="<p>This container has a 32px gap between items.</p>" />
          <Text text="<p>Notice the spacing is larger than the default.</p>" />
        </Container>
      </DemoContainer>

      <DemoContainer title="Horizontal with Space Between">
        <Container direction="horizontal" justify="between" className="w-full">
          <Text text="<strong>Left</strong>" />
          <Text text="<strong>Center</strong>" />
          <Text text="<strong>Right</strong>" />
        </Container>
      </DemoContainer>

      <DemoContainer title="Wrapping Horizontal Stack">
        <Container
          direction="horizontal"
          gap={12}
          wrap={true}
          className="max-w-md"
        >
          <Text text="<span class='px-3 py-1 bg-blue-100 rounded'>Tag 1</span>" />
          <Text text="<span class='px-3 py-1 bg-blue-100 rounded'>Tag 2</span>" />
          <Text text="<span class='px-3 py-1 bg-blue-100 rounded'>Tag 3</span>" />
          <Text text="<span class='px-3 py-1 bg-blue-100 rounded'>Tag 4</span>" />
          <Text text="<span class='px-3 py-1 bg-blue-100 rounded'>Tag 5</span>" />
          <Text text="<span class='px-3 py-1 bg-blue-100 rounded'>Tag 6</span>" />
          <Text text="<span class='px-3 py-1 bg-blue-100 rounded'>Tag 7</span>" />
        </Container>
      </DemoContainer>

      <DemoContainer title="Nested Containers">
        <Container direction="vertical" gap={20}>
          <Text text="<h4>Parent Container (Vertical)</h4>" />
          <Container
            direction="horizontal"
            gap={16}
            className="p-4 border rounded"
          >
            <Container direction="vertical" gap={8}>
              <Text text="<strong>Column 1</strong>" />
              <Text text="<p>Item A</p>" />
              <Text text="<p>Item B</p>" />
            </Container>
            <Container direction="vertical" gap={8}>
              <Text text="<strong>Column 2</strong>" />
              <Text text="<p>Item C</p>" />
              <Text text="<p>Item D</p>" />
            </Container>
          </Container>
        </Container>
      </DemoContainer>
    </>
  );
}
