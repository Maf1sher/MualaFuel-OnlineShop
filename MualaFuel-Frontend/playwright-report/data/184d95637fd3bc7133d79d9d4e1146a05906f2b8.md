# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e5]:
    - heading "MualaFuel" [level=1] [ref=e6]
    - generic [ref=e7]:
      - generic [ref=e8]:
        - generic [ref=e9]: Email
        - textbox "Email" [ref=e10]:
          - /placeholder: Enter your email
          - text: wrong@example.com
      - generic [ref=e11]:
        - generic [ref=e12]: Password
        - textbox "Password" [ref=e13]:
          - /placeholder: Enter your password
          - text: wrongpassword
      - button "Log In" [active] [ref=e14] [cursor=pointer]
    - paragraph [ref=e15]:
      - text: Don't have an account?
      - link "Sign Up" [ref=e16] [cursor=pointer]:
        - /url: /registration
  - img "Logo" [ref=e18]
```