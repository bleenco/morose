import { Pipe, PipeTransform } from '@angular/core';
import * as showdown from 'showdown';

@Pipe({
  name: 'markdown'
})
export class MarkdownPipe implements PipeTransform {
  public transform(markdown: string): string {
    const converter = new showdown.Converter();
    return converter.makeHtml(markdown);
  }
}
