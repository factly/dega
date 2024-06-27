package arrays

func Difference(prev []string, new []string) ([]string, []string) {
	del := make([]string, 0)

	if len(new) == 0 {
		return new, prev
	}

	if len(prev) == 0 {
		return new, del
	}

	for _, i := range prev {
		found := false
		for _, j := range new {
			if i == j {
				found = true
				break
			}
		}
		if !found {
			del = append(del, i)
		}
	}

	additional := subtraction(new, prev)

	return additional, del

}

func subtraction(arr1 []string, arr2 []string) []string {
	sub := make([]string, 0)
	for _, i := range arr1 {
		found := false
		for _, j := range arr2 {
			if i == j {
				found = true
				break
			}
		}
		if !found {
			sub = append(sub, i)
		}
	}
	return sub
}
