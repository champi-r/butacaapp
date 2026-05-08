import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BuscadorPage } from './tab2.page';

describe('Tab2Page', () => {
  let component: BuscadorPage;
  let fixture: ComponentFixture<BuscadorPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BuscadorPage],
      imports: [IonicModule.forRoot(), HttpClientTestingModule]
    }).compileComponents();

    fixture = TestBed.createComponent(BuscadorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
