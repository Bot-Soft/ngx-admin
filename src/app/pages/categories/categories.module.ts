import { NgModule } from '@angular/core';
import { AngularEchartsModule } from 'ngx-echarts';
import { ThemeModule } from '../../@theme/theme.module';
import { CategoriesComponent } from './categories.component';
import { CategoriesCardComponent } from './card/card.component';


@NgModule({
  imports: [
    ThemeModule,
    AngularEchartsModule,
  ],
  declarations: [
    CategoriesComponent,
    CategoriesCardComponent,
  ],
})
export class CategoriesModule { }
