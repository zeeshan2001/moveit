import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule }   from '@angular/router';
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule }   from '@angular/forms';
import { TranslateService } from '../translate/translate.service';
import { TRANSLATION_PROVIDERS } from '../translate/translation';
import { TranslatePipe } from '../translate/translate.pipe';
import { CookieService, CookieOptions } from 'angular2-cookie/core';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { DashComponent } from './dash/dash.component';
import { MigrationsComponent } from './migrations/migrations.component';
import { MenuComponent } from './menu/menu.component';
import { HistoryComponent } from './history/history.component';
import { CalendarComponent } from './calendar/calendar.component';
import { UploadComponent } from './upload/upload.component';
import { Shared } from '../classes/shared.singleton';
import { FileListComponent } from '../components/filelist/filelist.component';
import { DoughnutComponent } from '../components/doughnut/doughnut.component';
import { HistoryBox } from '../components/historybox/historybox.component';
import { FlagComponent } from '../components/flag/flag.component';
import { ServerComponent } from './server/server.component';
import { ComponentComponent } from './component/component.component';
import { ApplicationComponent } from './application/application.component';
import { ChartsModule } from 'ng2-charts';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToasterModule, ToasterService } from 'angular2-toaster';
import { ServerinfoComponent } from '../components/serverinfo/serverinfo.component';
import { ComponentInfo } from '../components/componentinfo/componentinfo.component';
import { SocketService } from '../classes/socket.service';
import { CommentComponent } from '../components/comment/comment.component';
import { SearchfieldComponent } from '../components/searchfield/searchfield.component';
import { PopupMigrate } from '../components/popup/popupmigrate/popupmigrate.component';
import { PopupServer } from '../components/popup/popupserver/popupserver.component';
import { PopupApplication } from '../components/popup/popupapplication/popupapplication.component';
import { HttpClientModule } from '@angular/common/http';
import { MoveServerComponent } from '../components/form/moveserver/moveserver.component';
import { CalendarWrapperComponent } from '../components/calendarwrapper/calendarwrapper.component';
import { InventoryAppComponent } from '../components/form/inventory_app/inventoryapp.component';
import { Ng2CompleterModule } from "ng2-completer";
import { OwlDateTimeModule, OwlNativeDateTimeModule, OWL_DATE_TIME_LOCALE } from 'ng-pick-datetime';
import { FullCalendarModule } from 'ng-fullcalendar';


@NgModule({
    imports: [
        BrowserModule,
        RouterModule.forRoot([{
                path: '',
                component: DashComponent,
                children:[{
                    path: '', redirectTo: 'dash', pathMatch: 'full'
                }, {
                    path: 'dash', component: HistoryComponent
                }, {
                    path: 'upload', component: UploadComponent
                }, {
                    path: 'server', component: ServerComponent
                }, {
                    path: 'migration', component: MigrationsComponent
                }, {
                    path: 'migration/:type', component: MigrationsComponent
                }, {
                    path: 'server/:server_id', component: ServerComponent
                }, {
                    path: 'server/status/:status', component: ServerComponent
                }, {
                    path: 'app', component: ApplicationComponent
                }, {
                    path: 'app/status/:status', component: ApplicationComponent
                }, {
                    path: 'component', component: ComponentComponent
                }, {
                    path: 'component/status/:status', component: ComponentComponent
                }, {
                    path: 'calendar', component: CalendarComponent
                }]
            }, {
                path: 'login',
                component: LoginComponent
            }
        ]),
        HttpModule,
        HttpClientModule,
        FormsModule,
        ChartsModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        Ng2CompleterModule,
        OwlDateTimeModule, 
        OwlNativeDateTimeModule,
        FullCalendarModule,
        ToasterModule.forRoot()
    ],
    declarations: [
        AppComponent,
        LoginComponent,
        DashComponent,
        CalendarComponent,
        TranslatePipe,
        MenuComponent,
        HistoryComponent,
        UploadComponent,
        FileListComponent,
        ServerComponent,
        ComponentComponent,
        ApplicationComponent,
        DoughnutComponent,
        HistoryBox,
        ServerinfoComponent,
        ComponentInfo,
        CommentComponent,
        FlagComponent,
        PopupMigrate,
        PopupServer,
        PopupApplication,
        MigrationsComponent,
        SearchfieldComponent,
        MoveServerComponent,
        InventoryAppComponent,
        CalendarWrapperComponent
    ],
    bootstrap:    [
        AppComponent
    ],
    providers:    [
        TranslateService,
        TRANSLATION_PROVIDERS,
        CookieService,
        {provide: CookieOptions, useValue: {}},
        {provide: OWL_DATE_TIME_LOCALE, useValue: 'de'},
        Shared,
        SocketService
    ]
})


export class AppModule {
}