import { Pipe, PipeTransform } from '@angular/core';
import * as marked from 'marked';

@Pipe({
  name: 'markdown'
})
export class MarkdownPipe implements PipeTransform {
  public transform(markdown: string, options?: MarkedOptions): string {
    return marked(markdown, options);
  }

  public static setOptions(options: MarkedOptions): void {
    marked.setOptions(options);
  }
}
