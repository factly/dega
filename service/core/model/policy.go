package model

// KetoPolicy model
type KetoPolicy struct {
	ID          string   `json:"id"`
	Subjects    []string `json:"subjects"`
	Actions     []string `json:"actions"`
	Resources   []string `json:"resources"`
	Effect      string   `json:"effect"`
	Description string   `json:"description"`
}

// KetoRole model
type KetoRole struct {
	ID      string   `json:"id"`
	Members []string `json:"members"`
}

// Permission model
type Permission struct {
	Resource string   `json:"resource"`
	Actions  []string `json:"actions"`
}

// Policy model
type Policy struct {
	ID          string       `json:"id"`
	Name        string       `json:"name"`
	Description string       `json:"description"`
	Permissions []Permission `json:"permissions"`
	Users       []Author     `json:"users"`
}
