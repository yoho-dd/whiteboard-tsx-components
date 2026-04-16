import { describe, it, expect, beforeAll } from 'vitest';
import { initWithGraphicUtils, measureText, type TextCharPropLike } from '../textMeasure';

let capturedTextProps: any = null;

beforeAll(() => {
  initWithGraphicUtils({
    GU: {},
    ctx: {},
    RenderText: class {
      textProps: any = null;
      paragraphs = [{ y: 0, height: 20, width: 80, lines: [{ width: 80 }] }];
      typesetting(_ctx: any, tp: any) {
        this.textProps = tp;
        const baseFontSize = tp.fontSize ?? 14;
        const charProps: any[] = tp.textCharProps ?? [];

        let maxFontSize = baseFontSize;
        for (const cp of charProps) {
          if (cp.fontSize && cp.fontSize > maxFontSize) {
            maxFontSize = cp.fontSize;
          }
        }

        const w = tp.text.length * maxFontSize * 0.6;
        const h = maxFontSize * 1.4;
        this.paragraphs = [{ y: 0, height: h, width: w, lines: [{ width: w }] }];
      }
      getContentRect(includeParagraphSpace = false) {
        const width = this.paragraphs[0]?.width ?? 0;
        let height = this.paragraphs[0]?.height ?? 0;
        const paraProps: any[] = this.textProps?.textParagraphProps ?? [];
        const hasQuote = paraProps.some(p => p.quote);
        if (hasQuote) {
          height += 16;
        }
        return { width: includeParagraphSpace ? width + (hasQuote ? 12 : 0) : width, height };
      }
    } as any,
    TextProps: class {
      text = '';
      fontSize = 14;
      fontFamily = '';
      bold = false;
      italic = false;
      sizeMode = 0;
      textCharProps: any[] = [];
      constructor() {
        capturedTextProps = this;
      }
      static refreshTextParagraphPropsListIndex(_arr: any[]): void {
        // Mock: tests don't depend on listIndex computation correctness.
      }
    } as any,
    TextParagraphProp: class {
      quote = false;
      listType = 0;
      indent = 0;
      listIndex = 1;
      listFontSize = 14;
      orderedListShowIndex = '';
    } as any,
    Rect: class {
      constructor(public x: number, public y: number, public w: number, public h: number) {}
    } as any,
    SizeModeEnum: { AUTO_WIDTH: 0, AUTO_HEIGHT: 1, FIXED: 2 },
  });
});

describe('measureText', () => {
  it('plain string without textCharProps uses base fontSize', () => {
    capturedTextProps = null;
    const result = measureText({ text: 'Hello', fontSize: 14, nodeType: 'text' });
    expect(capturedTextProps).not.toBeNull();
    expect(capturedTextProps.fontSize).toBe(14);
    expect(capturedTextProps.textCharProps).toEqual([]);
    expect(result.width).toBeGreaterThan(0);
    expect(result.height).toBeGreaterThan(0);
  });

  it('WBTextRun[] without textCharProps uses base fontSize', () => {
    capturedTextProps = null;
    const result = measureText({
      text: [{ content: 'Hello' }],
      fontSize: 14,
      nodeType: 'text',
    });
    expect(capturedTextProps.fontSize).toBe(14);
    expect(capturedTextProps.textCharProps).toEqual([]);
    expect(result.width).toBeGreaterThan(0);
  });

  it('textCharProps with larger fontSize produces wider measurement', () => {
    const textCharProps: TextCharPropLike[] = [
      { charIndexSet: new Set([0, 1, 2, 3, 4]), fontSize: 24, bold: true },
    ];

    const withoutCharProps = measureText({ text: 'Hello', fontSize: 14, nodeType: 'text' });
    const withCharProps = measureText({
      text: 'Hello',
      fontSize: 14,
      nodeType: 'text',
      richProps: { textCharProps },
    });

    expect(withCharProps.width).toBeGreaterThan(withoutCharProps.width);
    expect(withCharProps.height).toBeGreaterThan(withoutCharProps.height);
  });

  it('textCharProps are passed through to TextProps.textCharProps', () => {
    capturedTextProps = null;
    const textCharProps: TextCharPropLike[] = [
      { charIndexSet: new Set([0, 1, 2]), fontSize: 20, bold: true },
      { charIndexSet: new Set([3, 4]), fontSize: 16 },
    ];

    measureText({
      text: 'Hello',
      fontSize: 14,
      nodeType: 'text',
      richProps: { textCharProps },
    });

    expect(capturedTextProps.textCharProps).toHaveLength(2);
    expect(capturedTextProps.textCharProps[0].fontSize).toBe(20);
    expect(capturedTextProps.textCharProps[0].bold).toBe(true);
    expect(capturedTextProps.textCharProps[1].fontSize).toBe(16);
  });

  it('empty textCharProps array does not set textCharProps on TextProps', () => {
    capturedTextProps = null;
    measureText({
      text: 'Hello',
      fontSize: 14,
      nodeType: 'text',
      richProps: { textCharProps: [] },
    });
    expect(capturedTextProps.textCharProps).toEqual([]);
  });

  it('mixed run sizes: partial bold+large run produces correct measurement', () => {
    const textCharProps: TextCharPropLike[] = [
      { charIndexSet: new Set([0, 1, 2, 3]), fontSize: 14 },
      { charIndexSet: new Set([4, 5, 6]), fontSize: 28, bold: true },
    ];

    const uniform14 = measureText({ text: 'ABCDEFG', fontSize: 14, nodeType: 'text' });
    const mixedRun = measureText({
      text: 'ABCDEFG',
      fontSize: 14,
      nodeType: 'text',
      richProps: { textCharProps },
    });

    expect(mixedRun.width).toBeGreaterThan(uniform14.width);
  });

  it('trapezoid applies geometry compensation so fit-content width is larger than rect', () => {
    const rect = measureText({ text: 'Trap Bold', fontSize: 18, bold: true, nodeType: 'rect' });
    const trapezoid = measureText({ text: 'Trap Bold', fontSize: 18, bold: true, nodeType: 'trapezoid' });

    expect(trapezoid.width).toBeGreaterThan(rect.width);
    expect(trapezoid.height).toBeGreaterThan(rect.height);
  });

  it('quote paragraph props increase measured height', () => {
    const withoutQuote = measureText({
      text: 'Styled Quote:\nLarge bold quote.\nEnd.',
      fontSize: 16,
      bold: true,
      containerWidth: 300,
      nodeType: 'text',
    });
    const withQuote = measureText({
      text: 'Styled Quote:\nLarge bold quote.\nEnd.',
      fontSize: 16,
      bold: true,
      containerWidth: 300,
      nodeType: 'text',
      richProps: {
        textParagraphProps: [
          { quote: false, listType: 0, indent: 0 },
          { quote: true, listType: 0, indent: 0 },
          { quote: false, listType: 0, indent: 0 },
        ],
      },
    });

    expect(withQuote.height).toBeGreaterThan(withoutQuote.height);
  });
});
