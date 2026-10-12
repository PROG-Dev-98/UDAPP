import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { UserForm } from './user-form';

describe('UserForm', () => {
  let component: UserForm;
  let fixture: ComponentFixture<UserForm>;
  let httpTestingController: HttpTestingController;
  let router: Router;
  const apiUrl = 'https://localhost:7255/api/Users';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserForm],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserForm);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('requires age while allowing zero', () => {
    expect(component.userForm.controls.age.value).toBeNull();
    expect(component.userForm.controls.age.hasError('required')).toBe(true);

    component.userForm.controls.age.setValue(0);

    expect(component.userForm.controls.age.valid).toBe(true);
  });

  it('shows inline validation messages for an empty form', () => {
    component.onSubmit();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Name is required.');
    expect(fixture.nativeElement.textContent).toContain('Age is required.');
    expect(fixture.nativeElement.textContent).toContain('City is required.');
  });

  it('creates a user and redirects to the list with a success message', async () => {
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.userForm.setValue({
      name: 'Taylor Example',
      age: 0,
      city: 'Springfield',
      state: 'IL',
      pincode: '62701'
    });

    component.onSubmit();

    const request = httpTestingController.expectOne(apiUrl);
    expect(request.request.method).toBe('POST');
    expect(request.request.body.age).toBe(0);
    request.flush({
      id: 1,
      name: 'Taylor Example',
      age: 0,
      city: 'Springfield',
      state: 'IL',
      pincode: '62701'
    });
    await fixture.whenStable();

    expect(router.navigate).toHaveBeenCalledWith(['/users'], {
      state: { successMessage: 'User created successfully.' }
    });
  });
});
