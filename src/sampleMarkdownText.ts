export const sampleMarkdownText = `# Bulleted list with inline formatting
* **bold item**
* *italic item*
* ~~strikethrough item~~
* \`monospace item\`
***
## Ordered list with different style links
1. https://google.com
2. [Google](https://google.com)
***
### Custom replacement, e.g., emoji ( :text: )
***
### Blockquote
> Some quote from another source
***
#### Code block
\`\`\`ts
class Person {
    private name: string;
    private age: number;

    constructor(name: string, age: number) {
        this.name = name;
        this.age = age;
    }

    toString(): string {
        return \`\${this.name} (\${this.age}) (\${this.salary})\`;
    }
}
\`\`\`
`;
