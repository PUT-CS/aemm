import Text from "~/components/authoring/Text/Text";
import Container from "~/components/authoring/Container/Container";
import { DemoContainer } from "~/routes/demo/DemoContainer";

export default function MarginDemo() {
  return (
    <>
      <DemoContainer title="Horizontal Margin - 32px">
        <div className="bg-gray-100 dark:bg-gray-800">
          <Container horizontal={32}>
            <Text text="<p>This content has 32px horizontal margins (left and right).</p>" />
          </Container>
        </div>
      </DemoContainer>

      <DemoContainer title="Vertical Margin - 48px">
        <div className="bg-gray-100 dark:bg-gray-800">
          <Container vertical={48}>
            <Text text="<p>This content has 48px vertical margins (top and bottom).</p>" />
          </Container>
        </div>
      </DemoContainer>

      <DemoContainer title="Both Margins - 24px horizontal, 32px vertical">
        <div className="bg-gray-100 dark:bg-gray-800">
          <Container horizontal={24} vertical={32}>
            <Text text="<p>This content has both horizontal and vertical margins.</p>" />
          </Container>
        </div>
      </DemoContainer>

      <DemoContainer title="Page Layout Example - 64px horizontal, 40px vertical">
        <div className="bg-gray-100 dark:bg-gray-800 min-h-[400px]">
          <Container horizontal={64} vertical={40}>
            <Container direction="vertical" gap={24}>
              <Text text="<h2>Page Title</h2>" />
              <Text text="<p>This demonstrates a typical page layout with margins that create breathing room around the content.</p>" />
              <Text text="<p>The margins push the content away from the edges, making it more readable and visually appealing.</p>" />
            </Container>
          </Container>
        </div>
      </DemoContainer>

      <DemoContainer title="Nested Layout - Outer and Inner Margins">
        <div className="bg-gray-100 dark:bg-gray-800">
          <Container horizontal={48} vertical={32}>
            <Container direction="vertical" gap={16}>
              <Text text="<h3>Outer Container</h3>" />
              <div className="bg-white dark:bg-gray-900 rounded">
                <Container horizontal={24} vertical={16}>
                  <Text text="<p>Inner content with its own margins</p>" />
                </Container>
              </div>
            </Container>
          </Container>
        </div>
      </DemoContainer>

      <DemoContainer title="Responsive Content Area - 80px horizontal">
        <div className="bg-gray-100 dark:bg-gray-800 min-h-[300px]">
          <Container horizontal={80} vertical={20}>
            <Container direction="vertical" gap={16}>
              <Text text="<h2>Article Title</h2>" />
              <Text text="<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>" />
              <Text text="<p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>" />
            </Container>
          </Container>
        </div>
      </DemoContainer>

      <DemoContainer title="Zero Margins (Default)">
        <div className="bg-gray-100 dark:bg-gray-800">
          <Container>
            <Text text="<p>This content has no margins - it goes edge to edge.</p>" />
          </Container>
        </div>
      </DemoContainer>
    </>
  );
}
