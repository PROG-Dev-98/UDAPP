import {
ChangeDetectorRef,
Component,
inject,
OnInit
} from '@angular/core';
import { finalize } from 'rxjs';
import {
FormBuilder,
ReactiveFormsModule,
Validators
} from '@angular/forms';
import {
ActivatedRoute,
Router,
RouterLink
} from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
selector: 'app-user-form',
imports: [ReactiveFormsModule, RouterLink],
templateUrl: './user-form.html',
styleUrl: './user-form.css'
})
export class UserForm implements OnInit {
private readonly fb = inject(FormBuilder);
private readonly userService = inject(UserService);
private readonly router = inject(Router);
private readonly route = inject(ActivatedRoute);
private readonly cdr = inject(ChangeDetectorRef);

userId: number | null = null;
isEditMode = false;
isLoadingUser = false;
isSubmitting = false;
errorMessage = '';

userForm = this.fb.nonNullable.group({
name: ['', [
Validators.required,
Validators.minLength(2),
Validators.maxLength(100)
]],
age: [null as number | null, [
Validators.required,
Validators.min(0),
Validators.max(120),
Validators.pattern(/^\d+$/)
]],
city: ['', Validators.required],
state: ['', Validators.required],
pincode: ['', [
Validators.required,
Validators.minLength(4),
Validators.maxLength(10)
]]
});

ngOnInit(): void {
const id = this.route.snapshot.paramMap.get('id');

if (!id) {
  return;
}

const parsedId = Number(id);

if (!Number.isInteger(parsedId) || parsedId <= 0) {
  this.errorMessage = 'Invalid user ID.';
  return;
}

this.userId = parsedId;
this.isEditMode = true;
this.isLoadingUser = true;

this.userService.getUserById(parsedId)
  .pipe(
    finalize(() => {
      this.isLoadingUser = false;
      this.cdr.detectChanges();
    })
  )
  .subscribe({
    next: (user) => {
      this.userForm.patchValue({
        name: user.name,
        age: user.age,
        city: user.city,
        state: user.state,
        pincode: user.pincode
      });
    },
    error: (error) => {
      console.error('Failed to load user:', error);
      this.errorMessage =
        'Unable to load user details. Please try again.';
    }
  });

}

onSubmit(): void {
if (
this.userForm.invalid ||
this.isSubmitting ||
this.isLoadingUser
) {
this.userForm.markAllAsTouched();
return;
}

const age = this.userForm.controls.age.value;

if (age === null) {
  this.userForm.controls.age.markAsTouched();
  return;
}

const user = {
  name: this.userForm.controls.name.value.trim(),
  age,
  city: this.userForm.controls.city.value.trim(),
  state: this.userForm.controls.state.value.trim(),
  pincode: this.userForm.controls.pincode.value.trim()
};

if (!user.name || !user.city || !user.state || !user.pincode) {
  this.errorMessage = 'Please complete all fields.';
  return;
}

if (this.isEditMode && this.userId === null) {
  this.errorMessage = 'Unable to identify the user being edited.';
  return;
}

this.isSubmitting = true;
this.errorMessage = '';

this.isSubmitting = true;
this.errorMessage = '';

const handleSuccess = (): void => {
  void this.router.navigate(['/users'], {
    state: {
      successMessage: this.isEditMode
        ? 'User updated successfully.'
        : 'User created successfully.'
    }
  });
};

const handleError = (error: { status: number }): void => {
  console.error('Failed to save user:', error);
  this.errorMessage = error.status === 400
    ? 'Please check the values entered in each field.'
    : 'Unable to save the user. Please try again.';
};

const handleFinalize = (): void => {
  this.isSubmitting = false;
  this.cdr.detectChanges();
};

if (this.isEditMode && this.userId !== null) {
  this.userService.updateUser(this.userId, user)
    .pipe(finalize(handleFinalize))
    .subscribe({
      next: handleSuccess,
      error: handleError
    });
} else {
  this.userService.createUser(user)
    .pipe(finalize(handleFinalize))
    .subscribe({
      next: handleSuccess,
      error: handleError
    });
}
}

}