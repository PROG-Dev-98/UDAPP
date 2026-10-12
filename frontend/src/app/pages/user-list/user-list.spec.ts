import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting, TestRequest } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { UserList } from './user-list';

describe('UserList', () => {
  let component: UserList;
  let fixture: ComponentFixture<UserList>;
  let httpTestingController: HttpTestingController;
  let initialRequest: TestRequest;
  const apiUrl = 'https://localhost:7255/api/Users';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserList],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserList);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    initialRequest = httpTestingController.expectOne(apiUrl);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    initialRequest.flush([]);
  });

  it('loads and displays users from the API', () => {
    expect(initialRequest.request.method).toBe('GET');
    expect(fixture.nativeElement.textContent).toContain('Loading users...');
    expect(fixture.nativeElement.querySelector('.spinner')).not.toBeNull();

    initialRequest.flush([{
      id: 1,
      name: 'Taylor Example',
      age: 30,
      city: 'Springfield',
      state: 'IL',
      pincode: '62701'
    }]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Taylor Example');
    expect(fixture.nativeElement.textContent).toContain('62701');
  });

  it('shows the empty state when the API has no users', () => {
    initialRequest.flush([]);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No users found');
  });

  it('shows an error and retry action when loading fails', () => {
    initialRequest.error(new ProgressEvent('error'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'Unable to load users. Please try again.'
    );
    expect(fixture.nativeElement.querySelector('button')?.textContent).toContain('Retry');
  });
});
